import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  Unique,
} from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { IsEmail, IsNumber, Length } from 'class-validator';
import { PasswordResetToken } from './passwordResetToken.entity';
import { Campaign } from 'src/campaigns/entities/campaign.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
@Unique(['email', 'nickname'])
export class User extends CoreEntity {
  @Column()
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @Length(8, 64)
  password: string;

  @Column({ default: 0 })
  @Field(() => Number)
  @IsNumber()
  point: number;

  @Column()
  @Field(() => String)
  @Length(2, 20)
  nickname: string;

  @Field(() => [Campaign])
  @OneToMany(() => Campaign, (campaign) => campaign.user)
  campaign: Campaign[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens: PasswordResetToken[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) return;

    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async checkPassword(password: string) {
    try {
      const ok = await bcrypt.compare(password, this.password);

      return ok;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
