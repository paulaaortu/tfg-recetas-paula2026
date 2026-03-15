export interface Recipe {
    id: number;
    title: string;
    description: string;
    time: number;
    ingredients: string;
    steps: string;
    image_url?: string;
    category_id?: number;
    author_id?: number;
    is_official?: boolean;
    category_name?: string;
}
