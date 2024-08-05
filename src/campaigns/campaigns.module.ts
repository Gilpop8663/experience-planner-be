import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Campaign } from './entities/campaign.entity';
import { CampaignsResolver } from './campaigns.resolver';
import { CampaignsService } from './campaigns.service';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, User])],
  providers: [CampaignsResolver, CampaignsService],
})
export class CampaignsModule {}
