export interface StorageService {
  upload(path: string, location: string): Promise<string>
  uploadFolder(
    folderName: string,
    folderPath: string,
    storagePath: string,
  ): Promise<string>
  download(inputPath: string, outputPath: string): Promise<void>
}
