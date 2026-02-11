import { FaCheckCircle, FaUtensils, FaTruck, FaBoxOpen, FaClock, FaBan } from 'react-icons/fa';

// ── Order Status Configuration ──
// Single source of truth used across both client and admin panels

export const ORDER_STATUS = {
    PENDING: {
        icon: FaClock,
        label: 'Pending',
        color: 'var(--color-gray-500)',
        badgeClass: 'badge-warning',
        step: 0,
        next: 'RECEIVED',
        nextLabel: 'Accept Order',
    },
    RECEIVED: {
        icon: FaBoxOpen,
        label: 'Order Received',
        color: 'var(--color-info)',
        badgeClass: 'badge-info',
        step: 1,
        next: 'IN_KITCHEN',
        nextLabel: 'Start Cooking',
    },
    IN_KITCHEN: {
        icon: FaUtensils,
        label: 'In the Kitchen',
        color: 'var(--color-warning)',
        badgeClass: 'badge-warning',
        step: 2,
        next: 'SENT_TO_DELIVERY',
        nextLabel: 'Send to Delivery',
    },
    SENT_TO_DELIVERY: {
        icon: FaTruck,
        label: 'Out for Delivery',
        color: 'var(--color-info)',
        badgeClass: 'badge-info',
        step: 3,
        next: 'DELIVERED',
        nextLabel: 'Mark Delivered',
    },
    DELIVERED: {
        icon: FaCheckCircle,
        label: 'Delivered',
        color: 'var(--color-success)',
        badgeClass: 'badge-success',
        step: 4,
        next: null,
        nextLabel: null,
    },
    CANCELLED: {
        icon: FaBan,
        label: 'Cancelled',
        color: 'var(--color-error)',
        badgeClass: 'badge-error',
        step: 0,
        next: null,
        nextLabel: null,
    },
};

export const getStatusConfig = (status) => ORDER_STATUS[status] || ORDER_STATUS.PENDING;

// Steps shown in the order tracker (excludes PENDING & CANCELLED)
export const TRACKER_STEPS = [
    { key: 'RECEIVED', icon: FaBoxOpen, label: 'Received' },
    { key: 'IN_KITCHEN', icon: FaUtensils, label: 'Kitchen' },
    { key: 'SENT_TO_DELIVERY', icon: FaTruck, label: 'Delivery' },
    { key: 'DELIVERED', icon: FaCheckCircle, label: 'Delivered' },
];

// App-wide brand constants
export const BRAND = {
    name: 'SliceCraft',
    tagline: 'Craft your perfect slice.',
    currency: '₹',
};
