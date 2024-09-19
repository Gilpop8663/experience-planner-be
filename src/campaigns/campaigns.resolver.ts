import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignFromLinkInput,
  CreateCampaignFromLinkOutput,
} from './dtos/create-campaign-link.dto';
import {
  CreateCampaignDirectlyInput,
  CreateCampaignDirectlyOutput,
} from './dtos/create-campaign-directly.dto';
import {
  DeleteCampaignInput,
  DeleteCampaignOutput,
} from './dtos/delete-campaign.dto';
import {
  EditCampaignInput,
  EditCampaignOutput,
} from './dtos/edit-campaign.dto';
import {
  GetCalendarCampaignListInput,
  GetCalendarCampaignListOutput,
} from './dtos/get-calendar-campaign-list.dto';
import { GetExpiredCampaignListSortedByDeadlineOutput } from './dtos/get-expired-campaign-list-sorted-by-deadline.dto';
import {
  GetCampaignDetailInput,
  GetCampaignDetailOutPut,
} from './dtos/get-campaign-detail.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  GetSponsorshipCostAndConsumptionInput,
  GetSponsorshipCostAndConsumptionOutput,
} from './dtos/get-sponsorship-cost-and-consumption.dto';
import { GetTotalSponsorshipCostAndConsumptionOutput } from './dtos/get-total-sponsorship-cost-and-consumption.dto';
import {
  CreateGangnamCampaignInput,
  CreateGangnamCampaignOutput,
} from './dtos/create-gangnam-campaign';
@Resolver()
export class CampaignsResolver {
  constructor(private readonly campaignService: CampaignsService) {}

  @Mutation(() => CreateCampaignFromLinkOutput)
  createCampaignFromLink(@Args('input') input: CreateCampaignFromLinkInput) {
    return this.campaignService.createCampaignFromLink(input);
  }

  @Mutation(() => CreateCampaignDirectlyOutput)
  createCampaignDirectly(@Args('input') input: CreateCampaignDirectlyInput) {
    return this.campaignService.createCampaignDirectly(input);
  }

  @Mutation(() => CreateGangnamCampaignOutput)
  createGangnamCampaign(@Args('input') input: CreateGangnamCampaignInput) {
    return this.campaignService.createGangnamCampaign(input);
  }

  @Mutation(() => DeleteCampaignOutput)
  deleteCampaign(@Args('input') input: DeleteCampaignInput) {
    return this.campaignService.deleteCampaign(input);
  }

  @Mutation(() => EditCampaignOutput)
  editCampaign(@Args('input') input: EditCampaignInput) {
    return this.campaignService.editCampaign(input);
  }

  @Query(() => GetCalendarCampaignListOutput)
  getCalendarCampaignList(@Args('input') input: GetCalendarCampaignListInput) {
    return this.campaignService.getCalendarCampaignList(input);
  }

  @Query(() => GetCalendarCampaignListOutput)
  getCampaignListSortedByDeadline() {
    return this.campaignService.getCampaignListSortedByDeadline();
  }

  @Query(() => GetExpiredCampaignListSortedByDeadlineOutput)
  getExpiredCampaignListSortedByDeadline() {
    return this.campaignService.getExpiredCampaignListSortedByDeadline();
  }

  @Query(() => GetCampaignDetailOutPut)
  @UseGuards(AuthGuard)
  getCampaignDetail(
    @Args('input') input: GetCampaignDetailInput,
    @AuthUser() user: User,
  ) {
    return this.campaignService.getCampaignDetail(input, user.id);
  }

  @Query(() => GetSponsorshipCostAndConsumptionOutput)
  @UseGuards(AuthGuard)
  getSponsorshipCostAndConsumption(
    @Args('input') input: GetSponsorshipCostAndConsumptionInput,
    @AuthUser() user: User,
  ) {
    return this.campaignService.getSponsorshipCostAndConsumption(
      input,
      user.id,
    );
  }

  @Query(() => GetTotalSponsorshipCostAndConsumptionOutput)
  @UseGuards(AuthGuard)
  getTotalSponsorshipCostAndConsumption(@AuthUser() user: User) {
    return this.campaignService.getTotalSponsorshipCostAndConsumption(user.id);
  }
}
