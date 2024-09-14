import { v4 as uuidv4 } from 'uuid';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class PasswordResetToken extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @ManyToOne(() => User, (user) => user.passwordResetTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column()
  @Field(() => Date)
  expiresAt: Date;

  @BeforeInsert()
  setExpiryDate() {
    const currentDate = new Date();
    this.expiresAt = new Date(currentDate.getTime() + 3600 * 1000); // 1시간 뒤 만료
  }

  @BeforeInsert()
  createCode() {
    this.code = uuidv4();
  }
}
