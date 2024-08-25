import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @Column()
  @Field(() => String)
  email: string;

  @Column({ default: false })
  @Field(() => Boolean)
  verified: boolean;

  @BeforeInsert()
  createCode() {
    this.code = Math.floor(100000 + Math.random() * 900000).toString();
  }
}
