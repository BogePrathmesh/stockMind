export const generateReceiptId = () => {
  const timestamp = Date.now().toString().slice(-8);
  return `RCP-${timestamp}`;
};

export const generateDeliveryId = () => {
  const timestamp = Date.now().toString().slice(-8);
  return `DO-${timestamp}`;
};

export const generateTransferId = () => {
  const timestamp = Date.now().toString().slice(-8);
  return `TRF-${timestamp}`;
};

export const generateAdjustmentId = () => {
  const timestamp = Date.now().toString().slice(-8);
  return `ADJ-${timestamp}`;
};



