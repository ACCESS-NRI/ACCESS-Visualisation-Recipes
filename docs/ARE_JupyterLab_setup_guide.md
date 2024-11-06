# ACCESS Visualisation recipes ARE JupyterLab setup guide
<p>Quick-start guide to setting up a JupyterLab session using the Australian Research Environment  to run the ACCESS Visualisation recipes.</p>

## 0. Pre-requisites

- *0.1* You will require a NCI account. If you do not yet have a NCI account, you can sign up on the [MyNCI website](https://my.nci.org.au).
- *0.2* To run the examples on Gadi you will need to be a member of project `xp65`, please log in to the [MyNCI website](https://my.nci.org.au) and join the project. Pconda/access-med it can take 1-2 days to receive membership approvals.

## 1. Open ARE on Gadi
Go to the [Australian Research Environment](https://are-auth.nci.org.au/) website and login with your **NCI username and password**.

<p align="center"><img src="assets_ARE/login.png" alt="drawing" width="60%"/></p>

[\[Back to top\]](https://github.com/ACCESS-NRI/CMIP7-Hackathon/blob/main/docs/2_ARE_JupyterLab_setup_guide.md#access-nri-cmip7-hackathon-are-jupyterlab-setup-guide)

## 2. Start JupyterLab App
Click on `JupyterLab` under *Featured Apps* to configure a new JupyterLab instance. This option is also available under the *All Apps* section at the bottom of the page and the *Interactive Apps* dropdown located in the top menu.

<p align="center"><img src="assets_ARE/jupyter_select.png" alt="drawing" width="60%"/></p>

[\[Back to top\]](https://github.com/ACCESS-NRI/CMIP7-Hackathon/blob/main/docs/2_ARE_JupyterLab_setup_guide.md#access-nri-cmip7-hackathon-are-jupyterlab-setup-guide)

## 3. Configure JupyterLab session
You will now be presented with the main JupyterLab instance configuration form. Please complete **only** the fields below - leave all other fields blank or to their default values.

- *3.1* **Walltime**: The number of hours the JupyterLab instance will run. For the hackathon, please insert a walltime of `4` hours.

<p align="center"><img src="assets_ARE/walltime.png" alt="drawing" width="60%"/></p>

- *3.2* **Queue**: Select `gpuvolta` from the dropdown menu.

<p align="center"><img src="assets_ARE/gpuvolta.png" alt="drawing" width="60%"/></p>

- *3.3* **Compute Size**: Select `1xGPU (1 gpu, 12 cpus, 95G mem)` from the dropdown menu.

<p align="center"><img src="assets_ARE/compute.png" alt="drawing" width="60%"/></p>

- *3.4* **Project**: Please use the research project to allocate compute cost.

<p align="center"><img src="assets_ARE/project.png" alt="drawing" width="60%"/></p>

- *3.5* **Storage**: This is the list of project data storage locations required to run the recipes. In ARE, storage locations need to be explicitly defined to access these data from within a JupyterLab instance. Do not forget to add the scratch and gdata storage of your research project.
```
scratch/xp65+gdata/xp65...
```

<p align="center"><img src="assets_ARE/storage.png" alt="drawing" width="60%"/></p>

- *3.6* Click `Advanced options ...`
  * Optional: You can check the box here to receive an email notification when your JupyterLab instance starts, but as we are running a relatively small instance, it will likely spin up quickly so this probably isn't necessary.</p>

- *3.6* **Module directories**: To load the required environment modules, please copy and paste the following. This is equivalent to using `module use` on the command line.
```
/g/data/xp65/public/modules
```

<p align="center"><img src="assets_ARE/module_directories.png" alt="drawing" width="60%"/></p>

- *3.7* **Modules** To load the ESMValTool-workflow environment, please copy and paste the following. This is equivalent to using `module load` on the command line.
```
conda/access-med
```

<p align="center"><img src="assets_ARE/modules.png" alt="drawing" width="60%"/></p>

- *3.7* Click `Launch` to start your JupyterLab instance.


<p align="center"><img src="assets_ARE/launch.png" alt="drawing" width="60%"/></p>


## 4. Launch a JupyterLab session
Once you have clicked `Launch` the browser will redirect to the 'interactive sessions' page where you will see your JupyterLab instance details and current status which will look something like this:

<p align="center"><img src="assets_ARE/queue.png" alt="drawing" width="60%"/></p>

Once the JupyterLab instance has started (this usually takes around 30 seconds), this status window should update and look something like the following, reporting that the instance has started and the time remaining. More detailed information on the instance can be accessed by clicking the `Session ID` link.

<p align="center"><img src="assets_ARE/running.png" alt="drawing" width="60%"/></p>

Click `Open JupyterLab`. This opens the instance in a new browser window where you can navigate to the location of the cloned tutorial files.

