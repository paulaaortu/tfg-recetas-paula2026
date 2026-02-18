export interface Recipe {
    id: number;
    title: string;
    description: string;
    ingredients: string;
    steps: string;
    image_url?: string;
}
