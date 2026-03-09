export interface Recipe {
    id: number;
    title: string;
    description: string;
    time: number;
    ingredients: string;
    steps: string;
    image_url?: string;
}
