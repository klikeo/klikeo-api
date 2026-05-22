"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'No autorizado' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Prohibido' });
            return;
        }
        next();
    };
}
