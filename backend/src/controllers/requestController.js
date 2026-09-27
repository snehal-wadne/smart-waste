const prisma = require("../prisma");

const isValidPickupDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return isRealDate && value >= today;
};

// Generates WC-2026-0001, WC-2026-0002 etc.
const nextRequestNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `WC-${year}-`;
  const latest = await prisma.collectionRequest.findFirst({
    where: { requestNumber: { startsWith: prefix } },
    orderBy: { requestNumber: "desc" },
    select: { requestNumber: true },
  });
  const sequence = latest
    ? Number(latest.requestNumber.slice(prefix.length)) + 1
    : 1;

  return `${prefix}${String(sequence).padStart(4, "0")}`;
};

// POST /api/requests or POST /api/collection-requests
const createCollectionRequest = async (req, res, next) => {
  try {
    const {
      userName,
      userPhone,
      userEmail,
      wasteCategoryId,
      wasteDescription,
      quantity,
      pickupAddress,
      address, // fallback
      city,
      pincode,
      preferredDate,
      pickupDate, // fallback
      preferredTime,
      pickupTimeSlot, // fallback
      notes,
      estimatedWeightKg,
    } = req.body;

    const finalAddress = pickupAddress || address;
    const finalDate = preferredDate || pickupDate;
    const finalTime = preferredTime || pickupTimeSlot;

    if (!userName || !userName.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }
    if (!userPhone || !userPhone.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Phone is required." });
    }
    if (!wasteCategoryId) {
      return res
        .status(400)
        .json({ success: false, message: "Waste category must be selected." });
    }
    if (!finalAddress || !finalAddress.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Pickup address is required." });
    }
    if (!finalDate) {
      return res
        .status(400)
        .json({ success: false, message: "Pickup date is required." });
    }
    if (!isValidPickupDate(String(finalDate))) {
      return res.status(400).json({
        success: false,
        message: "Pickup date must be a valid date that is not in the past.",
      });
    }
    if (!finalTime || !finalTime.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Pickup time is required." });
    }

    const category = await prisma.wasteCategory.findUnique({
      where: { id: wasteCategoryId },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Selected waste category not found.",
      });
    }

    let newRequest;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        const reqNum = await nextRequestNumber();
        newRequest = await prisma.collectionRequest.create({
          data: {
            requestNumber: reqNum,
            trackingCode: reqNum,
            userName: userName.trim(),
            userPhone: userPhone.trim(),
            userEmail: userEmail ? userEmail.trim() : null,
            wasteCategoryId,
            wasteDescription: wasteDescription ? wasteDescription.trim() : null,
            pickupAddress: finalAddress.trim(),
            city: city ? city.trim() : "Metro City",
            pincode: pincode ? pincode.trim() : null,
            preferredDate: String(finalDate).trim(),
            preferredTime: String(finalTime).trim(),
            notes: notes ? notes.trim() : null,
            estimatedWeightKg: estimatedWeightKg
              ? parseFloat(estimatedWeightKg)
              : quantity
                ? parseFloat(quantity)
                : null,
            status: "PENDING",
            statusHistory: {
              create: {
                oldStatus: null,
                newStatus: "PENDING",
                note: "Collection request submitted by citizen",
              },
            },
          },
          include: {
            wasteCategory: true,
            statusHistory: { orderBy: { changedAt: "asc" } },
          },
        });
        break;
      } catch (error) {
        if (error.code !== "P2002" || attempt === 4) throw error;
      }
    }

    res.status(201).json({
      success: true,
      message: "Collection request submitted successfully.",
      data: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests/track/:code or GET /api/requests/track?requestNumber=...
const getRequestByCode = async (req, res, next) => {
  try {
    const rawCode = req.params.code || req.query.requestNumber || req.query.code;
    if (!rawCode) {
      return res
        .status(400)
        .json({ success: false, message: "Request number is required." });
    }

    const trimmed = String(rawCode).trim();
    const noSpaces = trimmed.replace(/\s+/g, "");

    // Build candidate search strings
    const candidates = new Set([trimmed, noSpaces, trimmed.toUpperCase(), noSpaces.toUpperCase()]);

    // Handle pure digits (e.g. "1" -> "WC-2026-0001", "27" -> "WC-2026-0027")
    if (/^\d{1,4}$/.test(trimmed)) {
      const padded = trimmed.padStart(4, "0");
      candidates.add(`WC-2026-${padded}`);
      candidates.add(`WC2026${padded}`);
    }

    // Handle variations like WC20260001 or WC-2026-1
    const match = trimmed.match(/^WC[-_]?2026[-_]?(\d+)$/i);
    if (match) {
      const padded = match[1].padStart(4, "0");
      candidates.add(`WC-2026-${padded}`);
      candidates.add(`WC2026${padded}`);
    }

    // Build Prisma OR filters
    const orConditions = [];
    for (const c of candidates) {
      orConditions.push({ requestNumber: { equals: c, mode: "insensitive" } });
      orConditions.push({ trackingCode: { equals: c, mode: "insensitive" } });
      orConditions.push({ id: c });
    }

    // If search term looks like a phone number (7+ digits), also search userPhone
    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length >= 7) {
      orConditions.push({ userPhone: { contains: digitsOnly } });
    }

    const request = await prisma.collectionRequest.findFirst({
      where: {
        OR: orConditions,
      },
      orderBy: { createdAt: "desc" },
      include: {
        wasteCategory: true,
        statusHistory: { orderBy: { changedAt: "asc" } },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `No collection request found for "${trimmed}". Try sample code "WC-2026-0001" or search by phone.`,
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests/:id/history
const getRequestHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await prisma.collectionRequest.findFirst({
      where: {
        OR: [
          { id },
          { requestNumber: { equals: id.trim(), mode: "insensitive" } },
          { trackingCode: { equals: id.trim(), mode: "insensitive" } },
        ],
      },
      select: { id: true, requestNumber: true },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Request not found with id or number "${id}".`,
      });
    }

    const history = await prisma.requestStatusHistory.findMany({
      where: { requestId: request.id },
      orderBy: { changedAt: "asc" },
    });

    res.json({
      success: true,
      requestNumber: request.requestNumber,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests/user/:phone or GET /api/requests/citizen/:phone
const getRequestsByCitizenPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const cleanPhone = phone ? phone.trim() : "";
    const requests = await prisma.collectionRequest.findMany({
      where: {
        userPhone: {
          contains: cleanPhone,
        },
      },
      include: {
        wasteCategory: true,
        statusHistory: { orderBy: { changedAt: "asc" } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/requests
const getAllRequests = async (req, res, next) => {
  try {
    const requests = await prisma.collectionRequest.findMany({
      include: { wasteCategory: true, statusHistory: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCollectionRequest,
  getRequestByCode,
  getRequestHistory,
  getRequestsByCitizenPhone,
  getAllRequests,
};
