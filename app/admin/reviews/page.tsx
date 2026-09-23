import { db } from "../../../lib/db";
import { ReviewModerationControls } from "../ReviewModerationControls";

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({ include: { product: { select: { name: true } }, user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 200 });
  return <section className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-sm"><h2 className="mb-5 text-xl font-bold text-[#2C2E26]">Moderácia recenzií</h2>{reviews.length === 0 ? <p className="text-[#6B6E56]">Zatiaľ nie sú žiadne recenzie.</p> : <div className="space-y-4">{reviews.map((review) => <article key={review.id} className="rounded-xl border border-[#E8E6DF] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="font-bold">{review.product.name} · {review.rating}/5</p><p className="text-sm text-[#6B6E56]">{review.user.name} · {review.user.email} · {review.verifiedPurchase ? "overený nákup" : "neoverený nákup"}</p></div><p className="font-semibold text-[#8A9A5B]">{review.status}</p></div><p className="mt-3 whitespace-pre-wrap">{review.content}</p>{review.status === "PENDING" ? <ReviewModerationControls reviewId={review.id} /> : null}</article>)}</div>}</section>;
}
