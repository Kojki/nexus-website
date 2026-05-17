"use server";

import { revalidatePath } from "next/cache";

// サイト全体のキャッシュを一括クリアする関数
export async function revalidateSite() {
  revalidatePath('/', 'layout');
}
