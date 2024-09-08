export function isValidPrice(req, res, next) {
    const totalAmount = req.body.totalAmount;
    
    if (totalAmount < 0) {
        return res.status(400).json({ error: "Le prix ne peut être négatif" });
    }

    next();
}
