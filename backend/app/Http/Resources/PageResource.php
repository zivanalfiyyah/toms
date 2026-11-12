<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $authed = $request->user('sanctum') !== null;

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $authed ? $this->content : null,
            'content_html' => $authed ? $this->content_html : null,
            'content_text' => $authed ? $this->content_text : null,
            'status' => $this->status,
            'order' => $this->order,
            'revision' => (int) ($this->revision ?: 1),
            'revision_label' => 'Rev. 1.'.max(0, ((int) ($this->revision ?: 1)) - 1),
            'updated_at' => $this->updated_at,
            'created_by' => $this->creator?->name,
            'updated_by' => $this->updater?->name,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'parent_id' => $this->parent_id,
            'likes_count' => $this->when(isset($this->likes_count), fn () => (int) $this->likes_count),
            'liked' => $this->when(isset($this->liked), fn () => (bool) $this->liked),
            'children' => PageResource::collection($this->whenLoaded('children')),
        ];
    }
}
