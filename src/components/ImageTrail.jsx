import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./ImageTrail.css";

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(e, rect) {
  let clientX = 0,
    clientY = 0;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function getMouseDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

class ImageItem {
  DOM = { el: null, inner: null };
  defaultStyle = { scale: 1, x: 0, y: 0, opacity: 0 };
  rect = null;

  constructor(DOM_el) {
    this.DOM.el = DOM_el;
    this.DOM.inner = this.DOM.el.querySelector(".content__img-inner");
    this.getRect();
    this.initEvents();
  }
  initEvents() {
    this.resize = () => {
      gsap.set(this.DOM.el, this.defaultStyle);
      this.getRect();
    };
    window.addEventListener("resize", this.resize);
  }
  getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }
}

class ImageTrailVariant1 {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };
    this.images = [...this.DOM.el.querySelectorAll(".content__img")].map(
      (img) => new ImageItem(img),
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    const handlePointerMove = (ev) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("touchmove", handlePointerMove);

    const initRender = (ev) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", initRender);
      container.removeEventListener("touchmove", initRender);
    };
    container.addEventListener("mousemove", initRender);
    container.addEventListener("touchmove", initRender);
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: "power1",
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0,
      )
      .to(
        img.DOM.el,
        { duration: 0.4, ease: "power3", opacity: 0, scale: 0.2 },
        0.4,
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }
}

class ImageTrailVariant2 {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll(".content__img")].map(
      (img) => new ImageItem(img),
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    const handlePointerMove = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("touchmove", handlePointerMove);

    const initRender = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", initRender);
      container.removeEventListener("touchmove", initRender);
    };
    container.addEventListener("mousemove", initRender);
    container.addEventListener("touchmove", initRender);
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0,
      )
      .fromTo(
        img.DOM.inner,
        { scale: 2.8, filter: "brightness(250%)" },
        { duration: 0.4, ease: "power1", scale: 1, filter: "brightness(100%)" },
        0,
      )
      .to(
        img.DOM.el,
        { duration: 0.4, ease: "power2", opacity: 0, scale: 0.2 },
        0.45,
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }
}

class ImageTrailVariant3 {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll(".content__img")].map(
      (img) => new ImageItem(img),
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    const handlePointerMove = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("touchmove", handlePointerMove);

    const initRender = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", initRender);
      container.removeEventListener("touchmove", initRender);
    };
    container.addEventListener("mousemove", initRender);
    container.addEventListener("touchmove", initRender);
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          xPercent: 0,
          yPercent: 0,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0,
      )
      .fromTo(
        img.DOM.inner,
        { scale: 1.2 },
        { duration: 0.4, ease: "power1", scale: 1 },
        0,
      )
      .to(
        img.DOM.el,
        {
          duration: 0.6,
          ease: "power2",
          opacity: 0,
          scale: 0.2,
          xPercent: () => gsap.utils.random(-30, 30),
          yPercent: -200,
        },
        0.6,
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }
}

class ImageTrailVariant4 {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll(".content__img")].map(
      (img) => new ImageItem(img),
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    const hp = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener("mousemove", hp);
    container.addEventListener("touchmove", hp);
    const ir = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", ir);
      container.removeEventListener("touchmove", ir);
    };
    container.addEventListener("mousemove", ir);
    container.addEventListener("touchmove", ir);
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance !== 0) {
      dx /= distance;
      dy /= distance;
    }
    dx *= distance / 100;
    dy *= distance / 100;
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0,
      )
      .fromTo(
        img.DOM.inner,
        {
          scale: 2,
          filter: `brightness(${Math.max((400 * distance) / 100, 100)}%) contrast(${Math.max((400 * distance) / 100, 100)}%)`,
        },
        {
          duration: 0.4,
          ease: "power1",
          scale: 1,
          filter: "brightness(100%) contrast(100%)",
        },
        0,
      )
      .to(img.DOM.el, { duration: 0.4, ease: "power3", opacity: 0 }, 0.4)
      .to(
        img.DOM.el,
        {
          duration: 1.5,
          ease: "power4",
          x: `+=${dx * 110}`,
          y: `+=${dy * 110}`,
        },
        0.05,
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }
}

class ImageTrailVariant5 {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll(".content__img")].map(
      (img) => new ImageItem(img),
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };
    this.lastAngle = 0;

    const hp = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener("mousemove", hp);
    container.addEventListener("touchmove", hp);
    const ir = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", ir);
      container.removeEventListener("touchmove", ir);
    };
    container.addEventListener("mousemove", ir);
    container.addEventListener("touchmove", ir);
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    if (angle > 90 && angle <= 270) angle += 180;
    const isMovingClockwise = angle >= this.lastAngle;
    this.lastAngle = angle;
    let startAngle = isMovingClockwise ? angle - 10 : angle + 10;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance !== 0) {
      dx /= distance;
      dy /= distance;
    }
    dx *= distance / 150;
    dy *= distance / 150;
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          filter: "brightness(80%)",
          scale: 0.1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
          rotation: startAngle,
        },
        {
          duration: 1,
          ease: "power2",
          scale: 1,
          filter: "brightness(100%)",
          x: this.mousePos.x - img.rect.width / 2 + dx * 70,
          y: this.mousePos.y - img.rect.height / 2 + dy * 70,
          rotation: this.lastAngle,
        },
        0,
      )
      .to(img.DOM.el, { duration: 0.4, ease: "expo", opacity: 0 }, 0.5)
      .to(
        img.DOM.el,
        {
          duration: 1.5,
          ease: "power4",
          x: `+=${dx * 120}`,
          y: `+=${dy * 120}`,
        },
        0.05,
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }
}

class ImageTrailVariant6 {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll(".content__img")].map(
      (img) => new ImageItem(img),
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };

    const hp = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener("mousemove", hp);
    container.addEventListener("touchmove", hp);
    const ir = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", ir);
      container.removeEventListener("touchmove", ir);
    };
    container.addEventListener("mousemove", ir);
    container.addEventListener("touchmove", ir);
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.3);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.3);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    requestAnimationFrame(() => this.render());
  }

  mapSpeedToSize(speed, minSize, maxSize) {
    return minSize + (maxSize - minSize) * Math.min(speed / 200, 1);
  }
  mapSpeedToBrightness(speed, minB, maxB) {
    return minB + (maxB - minB) * Math.min(speed / 70, 1);
  }
  mapSpeedToBlur(speed, minBlur, maxBlur) {
    return minBlur + (maxBlur - minBlur) * Math.min(speed / 90, 1);
  }
  mapSpeedToGrayscale(speed, minG, maxG) {
    return minG + (maxG - minG) * Math.min(speed / 90, 1);
  }

  showNextImage() {
    let dx = this.mousePos.x - this.cacheMousePos.x;
    let dy = this.mousePos.y - this.cacheMousePos.y;
    let speed = Math.sqrt(dx * dx + dy * dy);
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 0,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.8,
          ease: "power3",
          scale: this.mapSpeedToSize(speed, 0.3, 2),
          filter: `grayscale(${this.mapSpeedToGrayscale(speed, 600, 0) * 100}%) brightness(${this.mapSpeedToBrightness(speed, 0, 1.3) * 100}%) blur(${this.mapSpeedToBlur(speed, 20, 0)}px)`,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0,
      )
      .fromTo(
        img.DOM.inner,
        { scale: 2 },
        { duration: 0.8, ease: "power3", scale: 1 },
        0,
      )
      .to(
        img.DOM.el,
        { duration: 0.4, ease: "power3.in", opacity: 0, scale: 0.2 },
        0.45,
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }
}

function getNewPosition(position, offset, arr) {
  const realOffset = Math.abs(offset) % arr.length;
  return position - realOffset >= 0
    ? position - realOffset
    : arr.length - (realOffset - position);
}

class ImageTrailVariant7 {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll(".content__img")].map(
      (img) => new ImageItem(img),
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };
    this.visibleImagesCount = 0;
    this.visibleImagesTotal = Math.min(9, this.imagesTotal - 1);

    const hp = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener("mousemove", hp);
    container.addEventListener("touchmove", hp);
    const ir = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", ir);
      container.removeEventListener("touchmove", ir);
    };
    container.addEventListener("mousemove", ir);
    container.addEventListener("touchmove", ir);
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.3);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.3);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    ++this.visibleImagesCount;
    gsap.killTweensOf(img.DOM.el);
    const scaleValue = gsap.utils.random(0.5, 1.6);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          scale: scaleValue - Math.max(gsap.utils.random(0.2, 0.6), 0),
          rotationZ: 0,
          opacity: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
        },
        {
          duration: 0.4,
          ease: "power3",
          scale: scaleValue,
          rotationZ: gsap.utils.random(-3, 3),
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
        },
        0,
      );
    if (this.visibleImagesCount >= this.visibleImagesTotal) {
      const lastInQueue = getNewPosition(
        this.imgPosition,
        this.visibleImagesTotal,
        this.images,
      );
      const oldImg = this.images[lastInQueue];
      gsap.to(oldImg.DOM.el, {
        duration: 0.4,
        ease: "power4",
        opacity: 0,
        scale: 1.3,
        onComplete: () => {
          if (this.activeImagesCount === 0) this.isIdle = true;
        },
      });
    }
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
  }
}

class ImageTrailVariant8 {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };
    this.images = [...container.querySelectorAll(".content__img")].map(
      (img) => new ImageItem(img),
    );
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;
    this.activeImagesCount = 0;
    this.isIdle = true;
    this.threshold = 80;
    this.mousePos = { x: 0, y: 0 };
    this.lastMousePos = { x: 0, y: 0 };
    this.cacheMousePos = { x: 0, y: 0 };
    this.rotation = { x: 0, y: 0 };
    this.cachedRotation = { x: 0, y: 0 };
    this.zValue = 0;
    this.cachedZValue = 0;

    const hp = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };
    container.addEventListener("mousemove", hp);
    container.addEventListener("touchmove", hp);
    const ir = (ev) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", ir);
      container.removeEventListener("touchmove", ir);
    };
    container.addEventListener("mousemove", ir);
    container.addEventListener("touchmove", ir);
  }

  render() {
    let distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);
    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }
    if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1;
    requestAnimationFrame(() => this.render());
  }

  showNextImage() {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2,
      centerY = rect.height / 2;
    const relX = this.mousePos.x - centerX,
      relY = this.mousePos.y - centerY;
    this.rotation.x = -(relY / centerY) * 30;
    this.rotation.y = (relX / centerX) * 30;
    this.cachedRotation = { ...this.rotation };
    const distanceFromCenter = Math.sqrt(relX * relX + relY * relY);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    this.zValue = (distanceFromCenter / maxDistance) * 1200 - 600;
    this.cachedZValue = this.zValue;
    const brightness = 0.2 + ((this.zValue + 600) / 1200) * 2.3;
    ++this.zIndexVal;
    this.imgPosition =
      this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;
    const img = this.images[this.imgPosition];
    gsap.killTweensOf(img.DOM.el);
    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .set(this.DOM.el, { perspective: 1000 }, 0)
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          z: 0,
          scale: 1 + this.cachedZValue / 1000,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - img.rect.width / 2,
          y: this.cacheMousePos.y - img.rect.height / 2,
          rotationX: this.cachedRotation.x,
          rotationY: this.cachedRotation.y,
          filter: `brightness(${brightness})`,
        },
        {
          duration: 1,
          ease: "expo",
          scale: 1 + this.zValue / 1000,
          x: this.mousePos.x - img.rect.width / 2,
          y: this.mousePos.y - img.rect.height / 2,
          rotationX: this.rotation.x,
          rotationY: this.rotation.y,
        },
        0,
      )
      .to(
        img.DOM.el,
        { duration: 0.4, ease: "power2", opacity: 0, z: -800 },
        0.3,
      );
  }

  onImageActivated() {
    this.activeImagesCount++;
    this.isIdle = false;
  }
  onImageDeactivated() {
    this.activeImagesCount--;
    if (this.activeImagesCount === 0) this.isIdle = true;
  }
}

class ScrollImageTrail {
  constructor(container, boundaryEl) {
    this.container = container;
    this.boundaryEl = boundaryEl;
    this.DOM = { el: container };

    // 이미지 요소 수집
    const imgEls = container.querySelectorAll(".content__img");
    this.images = [...imgEls].map((img) => new ImageItem(img));
    this.imagesTotal = this.images.length;
    this.imgPosition = 0;
    this.zIndexVal = 1;

    // 💡 안전 예외 처리
    if (this.imagesTotal === 0) {
      console.warn(
        "ScrollImageTrail: No '.content__img' elements found inside the container.",
      );
      return;
    }

    // 💡 마우스 커서 이동 거리 감지 및 자석 효과를 위한 변수
    this.lastMousePos = { x: 0, y: 0 };
    this.threshold = 160; // 💡 겹침을 최소화하기 위해 이동 임계값 160px 유지
    this.maxVisibleImages = 3; // 💡 동시에 화면에 존재할 수 있는 최대 이미지 수 제한 (겹침 방지 핵심)

    this.mouseViewportPos = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    this.isFirstMove = true;
    this.isDestroyed = false;

    // 현재 화면에 활성화(노출)되어 자석 효과를 받을 이미지들의 배열
    this.activeImages = [];

    const handlePointerMove = (ev) => {
      if (this.isDestroyed) return;

      // 💡 히어로섹션(컨테이너)이 뷰포트를 완전히 벗어났을 때는 이미지 트레일 재생 전면 차단
      const guardEl = this.boundaryEl || this.container;
      const containerRect = guardEl.getBoundingClientRect();
      const inView = containerRect.bottom > 0 && containerRect.top < window.innerHeight;
      if (!inView) return;

      let clientX = 0,
        clientY = 0;
      if (ev.touches && ev.touches.length > 0) {
        clientX = ev.touches[0].clientX;
        clientY = ev.touches[0].clientY;
      } else {
        clientX = ev.clientX;
        clientY = ev.clientY;
      }

      // 실시간 마우스 좌표 최신화 (자석 목표점)
      this.mouseViewportPos = { x: clientX, y: clientY };

      if (this.isFirstMove) {
        this.lastMousePos = { x: clientX, y: clientY };
        this.isFirstMove = false;
        this.showNextImage(clientX, clientY);
        return;
      }

      const dx = clientX - this.lastMousePos.x;
      const dy = clientY - this.lastMousePos.y;
      const distance = Math.hypot(dx, dy);

      if (distance >= this.threshold) {
        this.showNextImage(clientX, clientY);
        this.lastMousePos = { x: clientX, y: clientY };
      }
    };
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    // 💡 아주 은은하고 느린 자석 효과를 실시간으로 그리기 위한 프레임 렌더러 구동
    requestAnimationFrame(() => this.render());

    this.destroy = () => {
      this.isDestroyed = true;
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      this.images.forEach((img) => {
        if (img.resize) window.removeEventListener("resize", img.resize);
      });
      this.activeImages = [];
    };

    container.__trail_destroy__ = this.destroy;
  }

  // 💡 자석(Magnetic) 애니메이션 프레임 루프
  render() {
    if (this.isDestroyed) return;

    // 현재 노출 중인 모든 활성화 이미지들을 자석처럼 마우스 커서 방향으로 당겨줍니다.
    this.activeImages.forEach((img) => {
      if (!img.rect) return;

      const targetX = this.mouseViewportPos.x;
      const targetY = this.mouseViewportPos.y;

      // 💡 개별 이미지마다 가지고 있는 자석 강도(magneticFactor)를 계수로 사용해 스르륵 당겨줍니다.
      // 반응 속도를 극도로 느리고 은은하게 설정하여 아련하게 한 박자 늦게 뒤쫓게 만듭니다.
      img.currentX = lerp(img.currentX, targetX, img.magneticFactor || 0);
      img.currentY = lerp(img.currentY, targetY, img.magneticFactor || 0);

      gsap.set(img.DOM.el, {
        x: img.currentX - img.rect.width / 2,
        y: img.currentY - img.rect.height / 2,
      });
    });

    requestAnimationFrame(() => this.render());
  }

  showNextImage(vx, vy) {
    if (!this.container.isConnected || this.imagesTotal === 0) {
      this.destroy();
      return;
    }

    // 뷰포트 영역 방어
    vx = Math.max(100, Math.min(window.innerWidth - 100, vx));
    vy = Math.max(100, Math.min(window.innerHeight - 100, vy));

    ++this.zIndexVal;
    this.imgPosition = (this.imgPosition + 1) % this.imagesTotal;
    const img = this.images[this.imgPosition];

    if (!img || !img.DOM.el) return;

    // 기존 애니메이션 초기화
    gsap.killTweensOf(img);
    gsap.killTweensOf(img.DOM.el);
    gsap.killTweensOf(img.DOM.inner);

    // 💡 팝업 타임라인 및 자석 트래킹 등록
    gsap
      .timeline({
        onStart: () => {
          img.currentX = vx;
          img.currentY = vy;
          img.magneticFactor = 0; // 💡 팝업 직후에는 자석력을 0으로 주어 최초 위치에 완전히 고정시킵니다!

          // 생성 즉시 렌더링 좌표 초기값을 강제로 지정하여 깜빡임 버그를 차단합니다.
          gsap.set(img.DOM.el, {
            x: vx - img.rect.width / 2,
            y: vy - img.rect.height / 2,
          });

          // 💡 최대 동시 표시 이미지 개수(maxVisibleImages)를 초과할 경우, 가장 오래된 이미지를 빠르게 소멸시킵니다.
          if (this.activeImages.length >= this.maxVisibleImages) {
            const oldestImg = this.activeImages.shift();
            if (oldestImg) {
              gsap.killTweensOf(oldestImg.DOM.el);
              gsap.to(oldestImg.DOM.el, {
                duration: 0.2,
                opacity: 0,
                scale: 0.2,
                ease: "power2.out",
              });
            }
          }

          // 중복 방지 처리 후 활성화 트래킹 목록에 등록
          if (!this.activeImages.includes(img)) {
            this.activeImages.push(img);
          }
        },
        onComplete: () => {
          // 애니메이션이 끝나 완전히 사라진 이미지는 리스트에서 제외
          this.activeImages = this.activeImages.filter((item) => item !== img);
        },
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 0,
          scale: 0.2,
          zIndex: this.zIndexVal,
          rotation: gsap.utils.random(-12, 12),
        },
        {
          duration: 0.3, // 💡 등장 속도를 0.3초로 설정하여 더 경쾌하고 가벼운 느낌 부여
          ease: "back.out(1.2)",
          scale: 1.0,
          opacity: 1,
        },
        0,
      )
      .fromTo(
        img.DOM.inner,
        { scale: 1.6, filter: "brightness(160%) contrast(110%)" },
        {
          duration: 0.3,
          ease: "power2.out",
          scale: 1,
          filter: "brightness(100%) contrast(100%)",
        },
        0,
      )
      // 💡 생성 0.1초 후부터, 0.2초 동안 아주 미세한 자석력(0.0025, 즉 0.25%)을 부드럽게 딜레이 충전하여 반응속도를 느리고 은은하게 가져갑니다.
      .to(
        img,
        {
          duration: 0.2,
          magneticFactor: 0.0025, // 💡 자석 끌림 계수를 극도로 낮춰(0.0025) 아주 천천히 반응하게 조율
          ease: "power1.in",
        },
        0.1,
      )
      // 💡 페이드아웃 시작 지점을 0.35초로 더욱 당겨서 화면에 겹겹이 쌓이는 지저분함을 방지합니다. (총 수명 약 0.65초로 컴팩트하게 압축)
      .to(
        img.DOM.el,
        {
          duration: 0.3,
          ease: "power2.inOut",
          opacity: 0,
          scale: 0.3,
          rotation: gsap.utils.random(-25, 25),
        },
        0.35,
      );
  }
}

const variantMap = {
  1: ImageTrailVariant1,
  2: ImageTrailVariant2,
  3: ImageTrailVariant3,
  4: ImageTrailVariant4,
  5: ImageTrailVariant5,
  6: ImageTrailVariant6,
  7: ImageTrailVariant7,
  8: ImageTrailVariant8,
  scroll: ScrollImageTrail,
};

export default function ImageTrail({ items = [], variant = 1, boundaryRef = null }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. 기존 인스턴스 클린업
    if (containerRef.current.__trail_destroy__) {
      containerRef.current.__trail_destroy__();
    }

    // 2-0. 💡 boundaryRef가 명시적으로 주어진 경우 최우선 사용, 없을 경우 fixed 레이저 감지 폴백 사용
    let checkEl = boundaryRef?.current || containerRef.current;

    if (!boundaryRef) {
      let parent = containerRef.current;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        if (style.position === "fixed") {
          if (parent.parentElement) {
            checkEl = parent.parentElement;
          }
          break;
        }
        parent = parent.parentElement;
      }
    }

    const Cls = variantMap[variant] || variantMap[1];
    const instance = new Cls(containerRef.current, checkEl);

    // 2. 💡 모든 Variant에 적용되는 뷰포트 감지 및 소멸 연동 최상위 동적 데코레이터 주입
    let isDestroyed = false;

    // 2-1. render() 루프를 가로채 뷰포트 이탈 시 백그라운드 sleep 모드화 (CPU 점유율 극대화 차단)
    if (instance && typeof instance.render === "function") {
      const originalRender = instance.render.bind(instance);
      instance.render = () => {
        if (isDestroyed) return;

        const rect = checkEl?.getBoundingClientRect();
        if (!rect) return;

        // 스크롤 상의 실제 부모가 뷰포트 내부에 있는지 정밀 가드
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;

        if (inView) {
          originalRender();
        } else {
          // 뷰포트 밖일 때는 150ms마다 징검다리 확인하여 루프 휴면 처리
          setTimeout(() => {
            if (!isDestroyed) requestAnimationFrame(() => instance.render());
          }, 150);
        }
      };
    }

    // 2-2. showNextImage() 실행 가로채기: 뷰포트 밖 마우스 무브 잔상으로 인한 이미지 소환 원천 차단
    if (instance && typeof instance.showNextImage === "function") {
      const originalShowNext = instance.showNextImage.bind(instance);
      instance.showNextImage = (...args) => {
        if (isDestroyed) return;

        const rect = checkEl?.getBoundingClientRect();
        if (!rect) return;

        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!inView) return; // 히어로 섹션을 벗어나면 이미지 생성을 전면 가드

        originalShowNext(...args);
      };
    }

    // 2-3. 공통 소멸자(commonDestroy) 정의 및 강제 바인딩
    const originalDestroy = instance.destroy ? instance.destroy.bind(instance) : null;
    const commonDestroy = () => {
      isDestroyed = true;
      if (originalDestroy) {
        originalDestroy();
      }
    };

    containerRef.current.__trail_destroy__ = commonDestroy;

    return () => {
      if (containerRef.current && containerRef.current.__trail_destroy__) {
        containerRef.current.__trail_destroy__();
      }
    };
  }, [variant, items]);

  return (
    <div className="content" ref={containerRef}>
      {items.map((url, i) => (
        <div className="content__img" key={i}>
          <div
            className="content__img-inner"
            style={{ backgroundImage: `url(${url})` }}
          />
        </div>
      ))}
    </div>
  );
}
