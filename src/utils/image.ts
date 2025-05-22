import { ElementModels } from "@kontent-ai/delivery-sdk";

export const createImageUrl = (asset: ElementModels.AssetModel, defaultRendition: string) => {
    const rendition = asset.renditions?.default?.url;
    if (rendition) {
        return `${asset.url}?${rendition}`;
    }

    return `${asset.url}?${defaultRendition}`;
};
