import { MatFormFieldAppearance } from '@angular/material/form-field';
import { UserInfo, OtherUserInfo } from './services/user/user.interface';
import { NBBook } from './services/book/book.interface';

/**
 * The appearance of input elements.
 */
export const inputAppearance: MatFormFieldAppearance = 'fill';

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
export function getUserImageURL(userInfo: UserInfo | OtherUserInfo): string {
  if (userInfo.imageID) {
    return `/image/${userInfo.imageID}?${new Date().getTime()}`;
  } else {
    return `https://avatars.dicebear.com/api/jdenticon/${userInfo.id}.svg`;
  }
}

/**
 * Get a book's image URL.
 *
 * @param bookInfo The book's details.
 * @returns The book's image URL.
 */
export function getBookImageURL(bookInfo: NBBook): string {
  return `/image/${bookInfo.imageID}?${new Date().getTime()}`;
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
    }
  }
}

/**
 * Copy text to the clipboard.
 *
 * @param val The text to copy.
 */
export function copyMessage(val: string): void {
  const selBox = document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  selBox.value = val;
  document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();
  document.execCommand('copy');
  document.body.removeChild(selBox);
}
