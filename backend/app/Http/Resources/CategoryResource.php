<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'slug' => $this->slug,
            'content' => $this->content,
            'content_html' => $this->content_html,
            'parent_id' => $this->parent_id,
            'order' => $this->order,
            'children' => CategoryResource::collection($this->whenLoaded('children')),
            'pages' => PageResource::collection($this->whenLoaded('pages')),
        ];
    }
}
