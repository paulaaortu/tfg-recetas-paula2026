import { Request, Response } from 'express';
// adminController puede permanecer para acciones administrativas específicas que no encajen en otro lugar,
// pero por ahora hemos movido los usuarios a userController y las recetas a recipeController.

export const adminActionPlaceholder = async (req: Request, res: Response) => {
    res.json({ message: "Admin controller placeholder" });
};
