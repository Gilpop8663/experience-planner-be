import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignLinkInput,
  CreateCampaignLinkOutput,
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
@Resolver()
export class CampaignsResolver {
  constructor(private readonly campaignService: CampaignsService) {}

  @Mutation(() => CreateCampaignLinkOutput)
  createCampaignFromLink(@Args('input') input: CreateCampaignLinkInput) {
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

  // @Mutation(() => CompleteSagaOutput)
  // completeSaga(@Args('input') input: CompleteSagaInput) {
  //   return this.sagaService.completeSaga(input);
  // }

  @Query(() => GetCalendarCampaignListOutput)
  getCalendarCampaignList(@Args('input') input: GetCalendarCampaignListInput) {
    console.log(input);
    return this.campaignService.getCalendarCampaignList(input);
  }
}
