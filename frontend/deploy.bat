@echo off
echo Building React app for production...
npm run build

echo.
echo Build complete! 
echo.
echo IMPORTANT: Upload the contents of the 'dist' folder to your live server.
echo The .htaccess file will be automatically included in the build.
echo.
echo Files to upload:
dir dist /b
echo.
pause
