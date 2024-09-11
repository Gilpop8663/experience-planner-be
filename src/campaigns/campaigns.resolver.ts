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
}
