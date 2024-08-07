import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IsNumber, IsString, Length } from 'class-validator';
import { User } from 'src/users/entities/user.entity';

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
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column()
  @Field(() => String)
  platformName: string;

  @Column()
  @Field(() => String)
  @IsString()
  thumbnailUrl: string;

  @Field(() => Boolean)
  isReserved: boolean;

  @Column({ default: null, nullable: true })
  @Field(() => Date)
  reservationDate: Date;

  @Column({ default: null, nullable: true })
  @Field(() => Date)
  reviewDeadline: Date;

  @Column()
  @Field(() => String)
  @IsString()
  serviceDetails: string;

  @Column({ default: 0 })
  @Field(() => Number)
  @IsNumber()
  serviceAmount: number;

  @Column({ default: 0 })
  @Field(() => Number)
  @IsNumber()
  extraAmount: number;

  @Column()
  @Field(() => String)
  location: string;

  @Column()
  @Field(() => String)
  detailedViewLink: string;
}
