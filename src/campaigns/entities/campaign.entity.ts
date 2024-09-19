import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsNumber, IsString, Length, Max, Min } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { AMOUNT } from '../constants';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Campaign extends CoreEntity {
  @Column()
  @Field(() => String)
  @Length(2, 30)
  @IsString()
  title: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column({ default: '' })
  @Field(() => String)
  platformName: string;

  @Column({ default: '' })
  @Field(() => String)
  @IsString()
  thumbnailUrl: string;

  @Field(() => Boolean)
  isReserved: boolean;

  @Column({ default: null, nullable: true })
  @Field(() => Date, { nullable: true })
  reservationDate: Date;

  @Column()
  @Field(() => Date)
  reviewDeadline: Date;

  @Column({ default: '' })
  @Field(() => String)
  @IsString()
  serviceDetails: string;

  @Column({ default: 0 })
  @Field(() => Number)
  @IsNumber()
  @Max(AMOUNT.MAX)
  @Min(AMOUNT.MIN)
  serviceAmount: number;

  @Column({ default: 0 })
  @Field(() => Number)
  @IsNumber()
  @Max(AMOUNT.MAX)
  @Min(AMOUNT.MIN)
  extraAmount: number;

  @Column({ default: '' })
  @Field(() => String)
  location: string;

  @Column({ default: '' })
  @Field(() => String)
  detailedViewLink: string;
}
