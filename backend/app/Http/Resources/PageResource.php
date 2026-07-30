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
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'content_html' => $this->content_html,
            'content_text' => $this->content_text,
            'status' => $this->status,
            'order' => $this->order,
            'created_by' => $this->creator?->name,
            'updated_by' => $this->updater?->name,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'parent_id' => $this->parent_id,
            'children' => PageResource::collection($this->whenLoaded('children')),
        ];
    }
}
