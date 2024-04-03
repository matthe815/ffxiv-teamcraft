import { Component } from '@angular/core';
import { RotationsFacade } from '../../../../modules/rotations/+state/rotations.facade';
import { RotationFoldersFacade } from '../../../../modules/rotation-folders/+state/rotation-folders.facade';
import { CraftingRotationsFolder } from '../../../../model/other/crafting-rotations-folder';
import { combineLatest, Observable } from 'rxjs';
import { CraftingRotation } from '../../../../model/other/crafting-rotation';
import { ActivatedRoute } from '@angular/router';
import { map, shareReplay } from 'rxjs/operators';
import { AuthFacade } from '../../../../+state/auth.facade';
import { CharacterNamePipe } from '../../../../pipes/pipes/character-name.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { PageLoaderComponent } from '../../../../modules/page-loader/page-loader/page-loader.component';
import { FullpageMessageComponent } from '../../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { RotationPanelComponent } from '../rotation-panel/rotation-panel.component';
import { FavoriteButtonComponent } from '../../../../modules/favorites/favorite-button/favorite-button.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { UserAvatarComponent } from '../../../../modules/user-avatar/user-avatar/user-avatar.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { SeoPageComponent } from '../../../../core/seo/seo-page-component';
import { SeoMetaConfig } from '../../../../core/seo/seo-meta-config';
import { SeoService } from '../../../../core/seo/seo.service';

@Component({
    selector: 'app-rotation-folder-page',
    templateUrl: './rotation-folder-page.component.html',
    styleUrls: ['./rotation-folder-page.component.less'],
    standalone: true,
    imports: [NgIf, NzCardModule, UserAvatarComponent, FlexModule, FavoriteButtonComponent, NgFor, RotationPanelComponent, FullpageMessageComponent, PageLoaderComponent, AsyncPipe, TranslateModule, CharacterNamePipe]
})
export class RotationFolderPageComponent extends SeoPageComponent {
  folder$: Observable<CraftingRotationsFolder>;

  rotations$: Observable<CraftingRotation[]>;

  userId$: Observable<string>;

  constructor(private rotationsFacade: RotationsFacade, private foldersFacade: RotationFoldersFacade,
              private authFacade: AuthFacade, private route: ActivatedRoute, private seo: SeoService) {
    super(seo)
    this.route.paramMap.pipe(
      map(params => params.get('folderId'))
    ).subscribe(folderId => {
      this.foldersFacade.loadFolder(folderId);
      this.foldersFacade.select(folderId);
    });
    this.userId$ = this.authFacade.userId$;
    this.folder$ = this.foldersFacade.selectedRotationFolder$;
    this.rotations$ = combineLatest([this.folder$, this.rotationsFacade.allRotations$]).pipe(
      map(([folder, rotations]) => {
        return folder.rotationIds
          .map(id => rotations.find(r => r.$key === id))
          .filter(rotation => rotation && !rotation.notFound);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  protected getSeoMeta(): Observable<Partial<SeoMetaConfig>> {
    return combineLatest([this.folder$, this.userId$]).pipe(
      map(([folder, userId]) => {
        return {
          title: `${folder.name} - FFXIV Teamcraft`,
          description: 'A list of crafting rotations.',
          url: `https://ffxivteamcraft.com/simulator/${userId}/rotation-folder/${folder.$key}`,
          image: 'https://ffxivteamcraft.com/assets/logo.png'
        };
      }
    ))
  }

}
