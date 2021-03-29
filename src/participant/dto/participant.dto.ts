import { IsEnum, IsNumber, IsNumberString, IsString } from 'class-validator';

enum Role {
  PLAYER = 'PLAYER',
  DEALER = 'DEALER',
}

class ParticipantCreateDto {
  @IsString()
  name: string;

  @IsEnum(Role)
  role: Role;

  @IsNumber()
  money: number;
}

class ParticipantIdDto {
  @IsNumberString()
  participantId: string;
}

export { ParticipantCreateDto, ParticipantIdDto, Role };
