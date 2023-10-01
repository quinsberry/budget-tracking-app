export interface ClientInfo {
    clientId:    string;
    name:        string;
    webHookUrl:  string;
    permissions: string;
    accounts:    Account[];
}

export interface Account {
    id:            string;
    sendId:        string;
    currencyCode:  number;
    balance:       number;
    creditLimit:   number;
    maskedPan:     string[];
    type:          AccountType;
    iban:          string;
    cashbackType?: CashbackType;
}

export enum CashbackType {
    None = 'None',
    UAH = 'UAH',
    Miles = 'Miles',
}

export enum AccountType {
    Black = "black",
    White = "white",
    Platinum = "platinum",
    Iron = "iron",
    Fop = "fop",
    Yellow = "yellow",
    EAid = "eAid"
}

export interface Invoice {
    id:              string;
    time:            number;
    description:     string;
    mcc:             number;
    originalMcc:     number;
    amount:          number;
    operationAmount: number;
    currencyCode:    number;
    commissionRate:  number;
    cashbackAmount:  number;
    balance:         number;
    hold:            boolean;
    comment?:        string;
    receiptId?:      string;
    invoiceId?:      string;
    counterEdrpou?:  string;
    counterIban?:    string;
    counterName?:    string;
}