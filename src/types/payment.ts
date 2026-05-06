export type PaymentMethodStatus = "active" | "inactive";

export interface PaymentMethodField {
    id: string;
    label: string;
    value: string;
}

export interface PaymentMethod {
    id: string;
    type: "cash" | "bank";
    name: string;
    image?: string;
    logoUrl?: string;
    instructions?: string;
    isActive: boolean;
    order?: number;
    fields: PaymentMethodField[];
    createdAt?: number;
}

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface PaymentRecord {
    id: string;
    orderId: string;
    methodId: string;
    methodName: string;
    customerName: string;
    senderAccountName?: string | null;
    senderAccountNumber?: string | null;
    receiverAccountName?: string | null;
    receiverAccountNumber?: string | null;
    senderBankOrWallet?: string | null;
    notes?: string;
    amount: number;
    status: PaymentStatus;
    createdAt: number;
    updatedAt: number;
    receiptUrl?: string;
    
    /** Approval */
    approvedAt?: number;
}
