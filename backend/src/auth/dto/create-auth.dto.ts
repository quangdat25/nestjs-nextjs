import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu cần ít nhất 6 ký tự' })
  password!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginAuthDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email!: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password!: string;
}
