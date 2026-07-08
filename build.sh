#! /bin/sh
rm -rf build dist
python -m eel dissolution.py web \
--windowed \
--icon "public/icon.icns" \
--add-data "logs/images/temp.png:logs/images" \
--add-data "logs/text:logs/text" \
--add-data "resources/bin/mac:resources/bin/mac/" \
--add-data "resources/dictionaries:resources/dictionaries/" \
--add-data "config.ini:."
# temporary fix for using os.path in MacOS
touch dist/dissolution.app/Contents/MacOS/wrapper
echo '#!/bin/bash' >> dist/dissolution.app/Contents/MacOS/wrapper
echo 'dir=$(dirname $0)' >> dist/dissolution.app/Contents/MacOS/wrapper
echo 'open -a Terminal file://${dir}/dissolution' >> dist/dissolution.app/Contents/MacOS/wrapper
chmod +x dist/dissolution.app/Contents/MacOS/wrapper
sed -i '' 's+MacOS/dissolution+MacOS/wrapper+' dist/dissolution.app/Contents/Info.plist
