"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUserFromEmailHeader = getCurrentUserFromEmailHeader;
const common_1 = require("@nestjs/common");
async function getCurrentUserFromEmailHeader(headers, usersRepo) {
    const raw = headers["x-user-email"];
    const email = (Array.isArray(raw) ? raw[0] : raw || "").trim();
    if (!email)
        throw new common_1.BadRequestException("Missing x-user-email header");
    const u = await usersRepo.findOne({ where: { email } });
    if (!u)
        throw new common_1.NotFoundException("Current user not found");
    const current = { id: u.id, email: u.email, role: u.role };
    return { current, userEntity: u };
}
//# sourceMappingURL=auth.util.js.map