export interface LaptopInventoryItem {
  no: number;
  propertyTagNew: string;
  propertyTagOld: string;
  purchasedDate: string;
  department: string;
  endUser: string;
  systemType: string;
  systemBrand: string;
  systemModel: string;
  motherboard: string;
  socket: string;
  chipset: string;
  processorSpec: string;
  ramBrandModel: string;
  ramSize: string;
  ramSerialNumber: string;
  ramInterface: string;
  storageModel: string;
  storageSize: string;
  videoCardModel: string;
  videoCardMemory: string;
  mouse: string;
  keyboard: string;
  dvdRom: string;
  serviceTag: string;
  displaySpec: string;
  displayPurchaseDate: string;
  displaySerialNumber: string;
  displayTagNumber: string;
  macAddress: string;
  wlan: string;
  lan: string;
  osType: string;
  osVersion: string;
  osSerialKey: string;
  officeType: string;
  officeVersion: string;
  officeSerialKey: string;
  location: string;
  status: string;
  remarks: string;
  price: string;
  configuredBy: string;
  computerName: string;
}

export const LAPTOP_INVENTORY_MOCK: LaptopInventoryItem[] = [
  {
    no: 1,
    propertyTagNew: 'INV-LAP-0001',
    propertyTagOld: 'OLD-001',
    purchasedDate: '2024-01-10',

    department: 'IT',
    endUser: 'Juan Dela Cruz',

    systemType: 'Laptop',
    systemBrand: 'Dell',
    systemModel: 'Latitude 5420',

    motherboard: 'Dell OEM',
    socket: 'FCLGA1200',
    chipset: 'Intel',
    processorSpec: 'Intel Core i5-1145G7',

    ramBrandModel: 'Kingston',
    ramSize: '16GB',
    ramSerialNumber: 'RAM123456',
    ramInterface: 'DDR4',

    storageModel: 'Samsung 970 EVO',
    storageSize: '512GB SSD',

    videoCardModel: 'Intel Iris Xe',
    videoCardMemory: 'Shared',

    mouse: 'Logitech B100',
    keyboard: 'Built-in',
    dvdRom: 'None',
    serviceTag: 'DELL-ST-001',

    displaySpec: '14" FHD',
    displayPurchaseDate: '2024-01-10',
    displaySerialNumber: 'MON123456',
    displayTagNumber: 'INV-MON-0001',

    macAddress: '00-11-22-33-44-55',
    wlan: 'Yes',
    lan: 'Yes',

    osType: 'Windows',
    osVersion: '11 Pro',
    osSerialKey: 'XXXXX-XXXXX-XXXXX',

    officeType: 'Microsoft 365',
    officeVersion: 'Apps for business',
    officeSerialKey: 'OFFICE-XXXXX',

    location: 'Head Office – 3F',
    status: 'In Use',
    remarks: 'Main laptop for IT staff',
    price: '65000',

    configuredBy: 'Admin User',
    computerName: 'IT-LAP-001'
  },
  // later you can add more rows here
];
