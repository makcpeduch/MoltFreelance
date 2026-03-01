Add-Type -AssemblyName System.Drawing

$inputPath = "c:\Users\Asus\Desktop\MoltFreelance\public\logo.png"
$outputPath = "c:\Users\Asus\Desktop\MoltFreelance\public\logo_perfect.png"

$img = [System.Drawing.Image]::FromFile($inputPath)
$bmp = New-Object System.Drawing.Bitmap($img)

$width = $bmp.Width
$height = $bmp.Height

$minX = $width
$minY = $height
$maxX = 0
$maxY = 0

# Find bounding box of non-transparent and non-white pixels
for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check if it's not transparent and not purely white (adjust tolerance if needed)
        if ($pixel.A -gt 10 -and -not ($pixel.R -gt 245 -and $pixel.G -gt 245 -and $pixel.B -gt 245)) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$boxWidth = $maxX - $minX + 1
$boxHeight = $maxY - $minY + 1

Write-Host "Found logo bounds: X=$minX Y=$minY W=$boxWidth H=$boxHeight"

# We want the final image to be a square.
# The user wants it to be slightly taller, meaning we should minimize vertical padding.
# Let's add an 8% padding around the longest dimension of the logo bounds.
$maxDim = [Math]::Max($boxWidth, $boxHeight)
$finalSize = [int][Math]::Round($maxDim * 1.08)

# Create final image
$finalBmp = New-Object System.Drawing.Bitmap($finalSize, $finalSize)
$g = [System.Drawing.Graphics]::FromImage($finalBmp)

# Make background transparent
$g.Clear([System.Drawing.Color]::Transparent)

# Calculate centered position
$destX = ($finalSize - $boxWidth) / 2
$destY = ($finalSize - $boxHeight) / 2

# Draw the exact bounded portion of the original image into the center of the new image
$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $boxWidth, $boxHeight)
$destRect = New-Object System.Drawing.Rectangle([int]$destX, [int]$destY, $boxWidth, $boxHeight)

# Use high quality interpolation
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$img.Dispose()
$bmp.Dispose()

$finalBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$finalBmp.Dispose()

Write-Host "Perfectly centered and sized logo saved."
