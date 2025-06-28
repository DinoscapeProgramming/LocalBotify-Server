const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

let lastScrollY = window.scrollY;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > 100) {
    navbar.style.background = "rgba(35, 39, 42, 0.98)";
    navbar.style.backdropFilter = "blur(15px)";
  } else {
    navbar.style.background = "rgba(35, 39, 42, 0.95)";
    navbar.style.backdropFilter = "blur(10px)";
  };

  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    navbar.style.transform = "translateY(-100%)";
  } else {
    navbar.style.transform = "translateY(0)";
  };

  lastScrollY = currentScrollY;
});

document.querySelectorAll(".faq-item").forEach(item => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");
  
  question.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    document.querySelectorAll(".faq-item").forEach((otherItem) => {
      if (otherItem === item) return;

      otherItem.classList.remove("active");
      const otherAnswer = otherItem.querySelector(".faq-answer");
      otherAnswer.style.maxHeight = "0";
    });
    
    if (isActive) {
      item.classList.remove("active");
      answer.style.maxHeight = "0";
    } else {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + "px";

      setTimeout(() => {
        answer.style.maxHeight = (answer.scrollHeight + 10) + "px";
        setTimeout(() => {
          answer.style.maxHeight = answer.scrollHeight + "px";
        }, 100);
      }, 200);
    };
  });
});

document.querySelector(".nav-logo").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));

    if (target) {
      const offsetTop = target.offsetTop - 80;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth"
      });
    };
  });
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";

      if (entry.target.classList.contains("feature-card")) {
        const cards = Array.from(entry.target.parentElement.children);
        const index = cards.indexOf(entry.target);
        entry.target.style.animationDelay = `${index * 0.1}s`;
      };
    };
  });
}, observerOptions);

document.querySelectorAll(".feature-card, .pricing-card, .section-header, .faq-item").forEach((element) => {
  element.style.opacity = "0";
  element.style.transform = "translateY(30px)";
  element.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";

  observer.observe(element);
});

document.querySelectorAll(".btn-primary, .btn-secondary").forEach((button) => {
  button.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - (size / 2);
    const y = e.clientY - rect.top - (size / 2);

    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.classList.add("ripple");

    this.appendChild(ripple);

    this.style.transform = "scale(0.98)";
    setTimeout(() => {
      this.style.transform = "";
    }, 150);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

const style = document.createElement("style");

style.textContent = `
  .btn-primary, .btn-secondary {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

document.head.appendChild(style);

const discordMockup = document.getElementById("discord-mockup");
const messages = document.getElementById("messages");

let hoverTimeout;
let messageCount = 0;

discordMockup.addEventListener("mouseenter", () => {
    clearTimeout(hoverTimeout);

    discordMockup.style.animation = "none";

    hoverTimeout = setTimeout(() => {
    messageCount++;
    const messageTexts = [
      "✨ Hover detected! Bot is responding...",
      "🚀 LocalBotify is working perfectly!",
      "💡 Creating amazing Discord experiences!",
      "⚡ Lightning-fast bot responses!",
      "🎯 Your bot is ready for action!"
    ];

    const newMessage = document.createElement("div");
    newMessage.className = "message dynamic-message";

    newMessage.innerHTML = `
      <div class="avatar bot">LB</div>
      <div class="message-content">
        <div class="message-header">
          <span class="username bot">LocalBotify</span>
          <span class="bot-tag">BOT</span>
          <span class="timestamp">Now</span>
        </div>
        <div class="message-text">${messageTexts[messageCount % messageTexts.length]}</div>
      </div>
    `;

    newMessage.style.opacity = "0";
    newMessage.style.transform = "translateY(30px) scale(0.9)";
    newMessage.style.transition = "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";

    messages.appendChild(newMessage);

    requestAnimationFrame(() => {
      newMessage.style.opacity = "1";
      newMessage.style.transform = "translateY(0) scale(1)";
    });
    
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "message typing-indicator";

    typingIndicator.innerHTML = `
      <div class="avatar bot">LB</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    messages.insertBefore(typingIndicator, newMessage);

    setTimeout(() => {
      if (typingIndicator.parentNode) {
        typingIndicator.style.opacity = "0";
        setTimeout(() => typingIndicator.remove(), 300);
      };
    }, 1000);
    
    setTimeout(() => {
      if (newMessage.parentNode) {
        newMessage.style.opacity = "0";
        newMessage.style.transform = "translateY(-20px) scale(0.9)";
        setTimeout(() => {
          if (newMessage.parentNode) newMessage.remove();
        }, 600);
      };
    }, 4000);
  }, 800);
});

discordMockup.addEventListener("mouseleave", () => {
  clearTimeout(hoverTimeout);
  discordMockup.style.animation = "";

  document.querySelectorAll(".dynamic-message, .typing-indicator").forEach(msg => {
    msg.style.opacity = "0";
    setTimeout(() => {
      if (msg.parentNode) msg.remove();
    }, 300);
  });
});

const typingStyle = document.createElement("style");

typingStyle.textContent = `
  .typing-indicator .message-content {
    display: flex;
    align-items: center;
  }
  
  .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 8px 12px;
    background: var(--background-light);
    border-radius: 12px;
    border: 1px solid var(--border-color);
  }
  
  .typing-dots span {
    width: 6px;
    height: 6px;
    background: var(--primary-color);
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;
  }
  
  .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
  .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  
  .dynamic-message {
    border-left: 3px solid var(--primary-color);
    padding-left: 8px;
    background: rgba(88, 101, 242, 0.05);
    border-radius: 0 8px 8px 0;
    margin-left: -8px;
  }
`;

document.head.appendChild(typingStyle);

document.querySelectorAll(".download-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const a = document.createElement("a");

    a.href = "https://github.com/DinoscapeProgramming/Remote-Control/releases/download/v1.0.0/Remote.Control.Setup.1.0.0.exe";

    a.click();

    const platform = this.dataset.platform || "windows";
    const originalText = this.innerHTML;

    this.style.pointerEvents = "none";
    this.style.opacity = "0.8";
    this.style.transform = "scale(0.98)";

    const progressBar = document.createElement("div");
    progressBar.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: var(--success-color);
      width: 0%;
      transition: width 2s ease;
      border-radius: 0 0 6px 6px;
    `;

    this.style.position = "relative";
    this.appendChild(progressBar);

    this.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="animate-spin">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
      Downloading...
    `;

    setTimeout(() => {
      progressBar.style.width = "100%";
    }, 100);

    setTimeout(() => {
      this.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Download Ready!
      `;

      this.style.background = "var(--success-color)";

      setTimeout(() => {
        this.innerHTML = originalText;
        this.style.pointerEvents = "auto";
        this.style.opacity = "1";
        this.style.transform = "";
        this.style.background = "";
        progressBar.remove();

        // showNotification(`LocalBotify installer download started successfully!`, "success");
      }, 1500);
    }, 2000);
  });
});

function showNotification(message, type = "info") {
  const notification = document.createElement("div");

  notification.style.cssText = `
    position: fixed;
    top: 22.5px;
    right: 20px;
    background: ${(type === "success") ? "var(--success-color)" : "var(--primary-color)"};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transform: translateX(100%);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 300px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      ${message}
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      notification.remove();
    }, 400);
  }, 4000);
};

const lazyLoadElements = document.querySelectorAll(".feature-card, .pricing-card, .faq-item");
const lazyLoadObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("loaded");

      entry.target.style.animation = "fadeInUp 0.6s ease-out forwards";

      lazyLoadObserver.unobserve(entry.target);
    };
  });
}, {
  threshold: 0.1,
  rootMargin: "50px"
});

lazyLoadElements.forEach(el => {
  lazyLoadObserver.observe(el);
});

const addPeriodicAnimations = () => {
  setInterval(() => {
    if (Math.random() > 0.7 && !discordMockup.matches(":hover")) {
      discordMockup.style.animation = "pulse 2s ease-in-out";

      setTimeout(() => {
        discordMockup.style.animation = "";
      }, 2000);
    };
  }, 15000);
  
  setInterval(() => {
    const onlineIndicator = document.querySelector(".pulse-dot");

    if (onlineIndicator) {
      onlineIndicator.style.animation = "none";
      setTimeout(() => {
        onlineIndicator.style.animation = "pulse-dot 1s infinite";
      }, 100);
    };
  }, 8000);
};

const pulseStyle = document.createElement("style");

pulseStyle.textContent = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 20px 40px var(--shadow-heavy);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 25px 50px rgba(88, 101, 242, 0.2);
    }
  }
`;

document.head.appendChild(pulseStyle);

setTimeout(addPeriodicAnimations, 3000);

document.addEventListener("click", (e) => {
  if (e.target.textContent.trim() === "Download For Free") {
    const a = document.createElement("a");

    a.href = "https://github.com/DinoscapeProgramming/Remote-Control/releases/download/v1.0.0/Remote.Control.Setup.1.0.0.exe";

    a.click();
  } else if (e.target.textContent === "Contact Support") {
    setTimeout(() => window.open("/support", "_self"), 250);
  } else if (e.target.textContent === "Join Discord") {
    setTimeout(() => window.open("https://discord.gg/2efZxNZfh5", "_blank"), 250);
  };
});

console.log(
  "%c⚠️ WARNING ⚠️%c\n\n%cHey there, LocalBotify user! 🚫 Do NOT paste anything here unless you know exactly what you're doing.",
  "color: white; background: red; font-size: 20px; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
  "",
  "color: white; background: #007ACC; font-size: 16px; padding: 6px 12px; border-radius: 6px;"
);