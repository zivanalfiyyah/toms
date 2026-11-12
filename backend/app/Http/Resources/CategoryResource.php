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
        $authed = $request->user('sanctum') !== null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'slug' => $this->slug,
            'content' => $authed ? $this->content : null,
            'content_html' => $authed ? $this->content_html : null,
            'parent_id' => $this->parent_id,
            'order' => $this->order,
            'revision' => (int) ($this->revision ?: 1),
            'revision_label' => 'Rev. 1.'.max(0, ((int) ($this->revision ?: 1)) - 1),
            'updated_at' => $this->updated_at,
            'children' => CategoryResource::collection($this->whenLoaded('children')),
            'pages' => PageResource::collection($this->whenLoaded('pages')),
        ];
    }
}
