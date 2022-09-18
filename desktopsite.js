import { WebDesktop } from "./webdesktop.module.js";


const desktop = document.getElementById("desktop");
const launcherList = document.querySelector(".launcher-list");
const modalSpace = document.querySelector(".modal-space");
const modalBtnList = document.querySelectorAll(".modal-btn-list");
const taskbarList = document.getElementById("taskbar-list");
const newFoldIcons = document.getElementById("newFoldIcons");
const newFoldBtn = document.getElementById("createFolderBtn");
const delFoldBtn = document.getElementById("delFolder");
const clickAbleImgs = document.querySelectorAll(".img-clickAble");
const imgModal = document.getElementById("image-modal");

const webDesktop = new WebDesktop(
desktop, launcherList, modalSpace,
modalBtnList, taskbarList, newFoldIcons,
newFoldBtn, delFoldBtn, clickAbleImgs, imgModal);
webDesktop.init();
