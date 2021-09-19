import { MatFormFieldAppearance } from '@angular/material/form-field';
import { UserInfo } from './services/user/user.interface';

/**
 * The appearance of input elements.
 */
export const inputAppearance: MatFormFieldAppearance = 'outline';

/**
 * The accepted image types.
 */
export const acceptImageTypes: string[] = ['.jpg', '.jpeg', '.png'];

/**
 * Wait asynchronously.
 *
 * @param ms The number of milliseconds to wait.
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get a user's image URL.
 *
 * @param userInfo The user's details.
 * @returns The user's image URL.
 */
export function getUserImageURL(userInfo: UserInfo): string {
  if (userInfo.imageID) {
    return `/image/${userInfo.imageID}?${new Date().getTime()}`;
  } else {
    return `https://avatars.dicebear.com/api/jdenticon/${userInfo.id}.svg`;
  }
}

/**
 * Update all images.
 */
export function updateImages(): void {
  const images = document.getElementsByClassName(
    'user-image',
  ) as HTMLCollectionOf<HTMLImageElement>;

  for (let i = 0; i < images.length; i++) {
    const image = images.item(i);

    if (image) {
      image.src += '?' + new Date().getTime();
      console.log(image.src);
    }
  }
}
