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

print(accessvis.__file__, accessvis.__version__)
print(lavavu.__file__, lavavu.__version__)

wd = os.getcwd()
lv = lavavu.Viewer()

def testNotebook(path):
    #Get filename without path and extension
    path = pathlib.Path(path)
    nbname = path.name
    nbfolder = str(path.parent)
    notebook = path.stem
    print(nbfolder, nbname, notebook)
    print("Testing Notebook: " + notebook)
    #Check if the test dir exists, if not create
    dirfound = os.path.exists('expected/' + notebook)
    print(os.path.exists('expected/' + notebook), 'expected/' + notebook)
    if not dirfound: 
        print("Creating dirs: " + 'expected/' + notebook)
        os.makedirs(os.path.join('expected/', notebook))

    #Notebooks must be converted to py before running or images will be generated inline and not saved to disk
    try:
        import nbformat
        from nbconvert import PythonExporter
        with open(path) as fh:
            nb = nbformat.reads(fh.read(), nbformat.NO_CONVERT)
            exporter = PythonExporter()
            source, meta = exporter.from_notebook_node(nb)
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
    subprocess.check_call(['python', 'runner.py', notebook+".py"])

    #Use output of the initial run as expected data
    if not dirfound:
        print("Using files created by initial run as expected output for tests")
        images = glob.glob("*.png") #+ glob.glob("*.jpg")
        print("EXPECTED IMAGES", images)
        for f in images:
            shutil.move(f, os.path.join('expected', notebook, f))
    else:
        #Check the image results
        ep = 'expected/' + notebook
        lv.testimages(tolerance=1e-4, expectedPath=ep)

    #Restore working dir
    os.chdir(wd)



filespec = wd + '/../*.ipynb'

notebooks = sorted(glob.glob(filespec))

for d in notebooks:
    print(d)
    testNotebook(d)

