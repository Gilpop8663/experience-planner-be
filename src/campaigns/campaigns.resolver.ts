import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignLinkInput,
  CreateCampaignLinkOutput,
} from './dtos/create-campaign-link.dto';
import {
  CreateCampaignDirectlyInput,
  CreateCampaignDirectlyOutput,
} from './dtos/create-campaign-directly.dto';

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

  // @Mutation(() => DeleteSagaOutput)
  // deleteSaga(@Args('input') deleteSagaInput: DeleteSagaInput) {
  //   return this.sagaService.deleteSaga(deleteSagaInput);
  // }

  // @Mutation(() => EditSagaOutput)
  // editSaga(@Args('input') editSagaInput: EditSagaInput) {
  //   return this.sagaService.editSaga(editSagaInput);
  // }

  // @Mutation(() => LikeSagaOutput)
  // setSagaLike(@Args('input') likeSagaInput: LikeSagaInput) {
  //   return this.likeService.likeSaga(likeSagaInput);
  // }

  // @Mutation(() => InterestSagaOutput)
  // setSagaInterest(@Args('input') interestSagaInput: InterestSagaInput) {
  //   return this.interestService.interestSaga(interestSagaInput);
  // }

  // @Mutation(() => CompleteSagaOutput)
  // completeSaga(@Args('input') input: CompleteSagaInput) {
  //   return this.sagaService.completeSaga(input);
  // }

  // @Query(() => [Saga])
  // getSagaList() {
  //   return this.sagaService.getSagaList();
  // }
}
