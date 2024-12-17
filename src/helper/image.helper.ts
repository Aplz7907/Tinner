import { fileTypeFromBuffer } from "file-type"
const acceptFileType = ['image/jpeg', 'image/png']
export const ImageHelper = {
    isImage: async function (file: ArrayBuffer): Promise<boolean> {
        // const buffer = await file.arrayBuffer()
        const filetype = await fileTypeFromBuffer(file)
        if (filetype === undefined)
            return false
        return acceptFileType.includes(filetype.mime)


    }
}
