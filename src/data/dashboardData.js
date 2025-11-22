export const navSequence = [
  { type: 'item', label: 'Products', path: '/products' },
  { type: 'operations' },
  { type: 'item', label: 'Move History', path: '/move-history' },
  { type: 'item', label: 'Stock', path: '/stock' },
  { type: 'item', label: 'Dashboard', path: '/dashboard' },
  { type: 'settings' },
];

export const operationsSubmenu = [
  { label: 'Receipt', path: '/receipts' },
  { label: 'Delivery Orders', path: '/delivery' },
  { label: 'Adjustment', path: '/stock' },
];

export const settingsSubmenu = [
  { label: 'Warehouse', path: '/warehouses' },
  { label: 'Location', path: '/locations' },
];

export const kpis = [
  { label: 'Total Products in Stock', value: '18,250', delta: '+230 today' },
  { label: 'Low / Out of Stock', value: '38 items', delta: '5 new alerts' },
  { label: 'Pending Receipts', value: '7 docs', delta: '3 awaiting approval' },
  { label: 'Pending Deliveries', value: '12 orders', delta: '4 ready to ship' },
  { label: 'Internal Transfers', value: '6 scheduled', delta: '2 urgent' },
];

export const dynamicFilters = {
  documentType: ['Receipts', 'Delivery', 'Internal', 'Adjustments'],
  status: ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'],
  location: ['Main Warehouse', 'Production Rack', 'Warehouse 2', 'Returns Area'],
  category: ['Steel', 'Fasteners', 'Electrical', 'Packaging'],
};

export const operations = [
  {
    title: 'Stock Receipt',
    description: 'Receive 150 kg Steel Rods from vendor and automatically update ledger.',
    status: 'Awaiting Approval',
    action: 'Validate Goods',
  },
  {
    title: 'Delivery Order',
    description: 'Pack and ship 40 steel frames to Distribution Center B.',
    status: 'Picking In Progress',
    action: 'Mark Packed',
  },
  {
    title: 'Adjustment',
    description: 'Log -3 kg damage on Steel inventory after QC inspection.',
    status: 'Recording',
    action: 'Save Adjustment',
  },
];

export const flowSteps = [
  {
    title: 'Receive Goods',
    detail: 'Incoming goods verified, stock +100.',
    badge: 'INCOMING',
  },
  {
    title: 'Internal Transfer',
    detail: 'Move to Production Rack, ledger keeps total constant.',
    badge: 'TRANSFER',
  },
  {
    title: 'Delivery',
    detail: 'Ship 20 units, stock decreases in source location.',
    badge: 'OUTGOING',
  },
  {
    title: 'Adjustment',
    detail: 'Subtract 3 kg for damages, keep audit trail.',
    badge: 'ADJUST',
  },
];

export const receipts = [
  {
    reference: 'WH/IN/0001',
    from: 'SteelCraft',
    to: 'WH/Stock1',
    contact: 'Azure Interior',
    scheduleDate: '22 Nov',
    status: 'Ready',
  },
  {
    reference: 'WH/IN/0002',
    from: 'Bolt House',
    to: 'WH/Stock1',
    contact: 'North Retail',
    scheduleDate: '23 Nov',
    status: 'Ready',
  },
  {
    reference: 'WH/IN/0003',
    from: 'Thermal Co',
    to: 'WH/Stock2',
    contact: 'Frame Labs',
    scheduleDate: '24 Nov',
    status: 'Waiting',
  },
];

export const deliveries = [
  {
    reference: 'WH/OUT/0001',
    from: 'WH/Stock1',
    to: 'vendor',
    contact: 'Azure Interior',
    scheduleDate: '22 Nov',
    status: 'Ready',
  },
  {
    reference: 'WH/OUT/0002',
    from: 'WH/Stock1',
    to: 'vendor',
    contact: 'Azure Interior',
    scheduleDate: '23 Nov',
    status: 'Ready',
  },
  {
    reference: 'WH/OUT/0003',
    from: 'WH/Stock2',
    to: 'vendor',
    contact: 'North Retail',
    scheduleDate: '24 Nov',
    status: 'Waiting',
  },
];

export const warehouses = [
  { name: 'Main Warehouse', code: 'WH-01', address: 'Plot 5, Industrial Area', status: 'Active' },
  { name: 'Warehouse 2', code: 'WH-02', address: 'Sector 8', status: 'Active' },
];

export const locations = [
  { name: 'Rack A', warehouse: 'Main Warehouse', type: 'Bin', capacity: '500 kg' },
  { name: 'Rack B', warehouse: 'Main Warehouse', type: 'Shelf', capacity: '300 kg' },
  { name: 'Production Floor', warehouse: 'Main Warehouse', type: 'Zone', capacity: '2,000 kg' },
];

export const moveHistory = [
  {
    reference: 'WH/IN/0001',
    date: '12/1/2001',
    contact: 'Azure Interior',
    from: 'vendor',
    to: 'WH/Stock1',
    quantity: '',
    status: 'Ready',
  },
  {
    reference: 'WH/OUT/0002',
    date: '12/1/2001',
    contact: 'Azure Interior',
    from: 'WH/Stock1',
    to: 'vendor',
    quantity: '',
    status: 'Ready',
  },
  {
    reference: 'WH/OUT/0002',
    date: '12/1/2001',
    contact: 'Azure Interior',
    from: 'WH/Stock2',
    to: 'vendor',
    quantity: '',
    status: 'Ready',
  },
  {
    reference: 'WH/IN/0003',
    date: '12/2/2001',
    contact: 'North Retail',
    from: 'vendor',
    to: 'WH/Stock1',
    quantity: '100 units',
    status: 'Done',
  },
  {
    reference: 'WH/OUT/0004',
    date: '12/2/2001',
    contact: 'Metal Works',
    from: 'WH/Stock1',
    to: 'vendor',
    quantity: '50 units',
    status: 'Done',
  },
];

export const stockAdjustments = [
  { product: 'Steel Rods', location: 'Main Warehouse', type: 'Positive', qty: '+20 kg', reason: 'Received extra' },
  { product: 'Frames', location: 'Warehouse 1', type: 'Negative', qty: '-3 units', reason: 'Damage' },
];

export const stock = [
  { id: 1, product: 'Desk', perUnitCost: '3000 Rs', onHand: 50, freeToUse: 45 },
  { id: 2, product: 'Table', perUnitCost: '3000 Rs', onHand: 50, freeToUse: 50 },
  { id: 3, product: 'Chair', perUnitCost: '1500 Rs', onHand: 30, freeToUse: 28 },
  { id: 4, product: 'Cabinet', perUnitCost: '5000 Rs', onHand: 20, freeToUse: 18 },
];

