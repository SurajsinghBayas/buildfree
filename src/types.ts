export interface Resource {
    toolName: string;
    useCase: string;
    category: string;
    tags: string[];
    freeWhat: string;
    duration: string;
    eligibility: string;
    requiresCreditCard: string;
    link: string;
    lastVerified: string;
    indiaFriendly: boolean;
    recommendedFor: string[];
    badge?: string;
    logo?: string;
    estimatedValue?: number;
}
