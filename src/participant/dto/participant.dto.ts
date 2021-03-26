import { IsEnum, IsString } from 'class-validator';

enum Role {
  PLAYER = 'PLAYER',
  DEALER = 'DEALER',
}

class ParticipantCreateDto {
  @IsString()
  name: string;

  @IsEnum(Role)
  role: Role;
}

export { ParticipantCreateDto, Role };
