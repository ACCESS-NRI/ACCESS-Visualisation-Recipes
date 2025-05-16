#!/usr/bin/env python
import lavavu
import accessvis
import os
import sys
import subprocess
import platform
import glob
import pathlib
import shutil
import re


print(accessvis.__file__, accessvis.__version__)
print(lavavu.__file__, lavavu.__version__)

wd = os.getcwd()
lv = lavavu.Viewer()

expected_dir = 'expected'
if len(sys.argv) > 1 and sys.argv[1] == 'thumbs':
    #Compare thumbnails to reduce render time
    print('Running image comparisons in thumbnail mode')
    expected_dir = 'expected_thumbs'

def testNotebook(path):
    #Get filename without path and extension
    path = pathlib.Path(path)
    nbname = path.name
    nbfolder = str(path.parent)
    notebook = path.stem
    print(nbfolder, nbname, notebook)
    print("Testing Notebook: " + notebook)
    exp_path = os.path.join(expected_dir, notebook)
    #Check if the test dir exists, if not create
    dirfound = os.path.exists(exp_path)
    if not dirfound: 
        print("Creating dirs: ", exp_path)
        os.makedirs(exp_path)

    #Notebooks must be converted to py before running or images will be generated inline and not saved to disk
    try:
        import nbformat
        from nbconvert import PythonExporter
        with open(path) as fh:
            nb = nbformat.reads(fh.read(), nbformat.NO_CONVERT)
            exporter = PythonExporter()
            source, meta = exporter.from_notebook_node(nb)
            #Reduced output resolution for software renderer
            if osmesa:
                thumb_res = 120
                source = re.sub(r"resolution=\([\dA-Za-z_]*,\s*[\dA-Za-z_]*\)", f"resolution=({thumb_res},{thumb_res})", source)
                source = re.sub(r"lv.display\(\)", f"lv.display(resolution=({thumb_res},{thumb_res}))", source)
                source = re.sub(r"lv.display\(\([\dA-Za-z_]*,\s*[\dA-Za-z_]*\)", f"lv.display(({thumb_res},{thumb_res})", source)

            fn = notebook + '.py'
            print(fn)
            with open(fn, 'w+') as f:
                f.write(source) #lines(source.encode('utf-8'))
    except (Exception) as e:
        print("Notebook conversion failed: ", e)
        pass

    #Change to working dir for test
    #os.chdir(notebook)

    #Remove any images from partial test run
    for im in glob.glob("*.png"):
        os.remove(im)
    #for im in glob.glob("*.jpg"):
    #    os.remove(im)

    #Execute converted script
    subprocess.check_call(['python', 'runner.py', notebook+".py"], env=os.environ.copy())

    #Use output of the initial run as expected data
    if not dirfound:
        print("Using files created by initial run as expected output for tests")
        images = glob.glob("*.png") #+ glob.glob("*.jpg")
        print("EXPECTED IMAGES", images)
        for f in images:
            shutil.move(f, os.path.join(exp_path, f))
    else:
        #Check the image results
        lv.testimages(tolerance=1e-4, expectedPath=exp_path)

    #Restore working dir
    os.chdir(wd)



filespec = wd + '/../*.ipynb'

notebooks = sorted(glob.glob(filespec))

for d in notebooks:
    print(d)
    testNotebook(d)

