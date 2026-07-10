import bcrypt from 'bcrypt';
const saltRounds = 10;
export const hashPasswordHelper = async (plainPassword: string) => {
  return await bcrypt.hash(plainPassword, saltRounds);
};
export const comparePasswordHelper = async (
  plainPassword: string,
  hashPassword: string,
) => {
  return await bcrypt.compare(plainPassword, hashPassword);
};
