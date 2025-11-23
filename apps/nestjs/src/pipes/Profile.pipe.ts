import { PipeTransform, Injectable } from '@nestjs/common';
import { ProfileManager } from '@repo/auth';
import { JwtPayload } from '@repo/auth/validation';

@Injectable()
export class ProfilePipe implements PipeTransform {
  constructor(private readonly profileManager: ProfileManager) {}

  async transform(value: JwtPayload) {
    const profile = await this.profileManager.getProfile(value);

    return profile;
  }
}
