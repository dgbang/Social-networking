# AI Skills Usage

Tai lieu nay huong dan cach su dung 3 skill Codex cho du an nay:

- `$phase-docs`: tao/cap nhat `req.md` va `design.md` trong thu muc tung phase.
- `$phase-testcases`: tao/cap nhat `testcase.md` trong thu muc tung phase.
- `$phase-code`: code theo tung phase.

Moi skill deu phai doc `AI_CODING_RULES.md` truoc khi lam viec. Sau do AI phai doc tai lieu lien quan trong `docs/` va `plans/`, khong duoc bia requirement, API, schema, permission, hoac business rule.

## Thu tu su dung khuyen nghi

Voi moi phase, nen di theo thu tu:

1. Tao requirement va thiet ke phase bang `$phase-docs`.
2. Tao testcase phase bang `$phase-testcases`.
3. Code phase bang `$phase-code`.
4. Chay test/check lien quan.
5. Cap nhat lai `plans/` neu co thay doi da duoc xac nhan.

Thu tu nay giup giu scope ro rang: co requirement truoc, co testcase sau, roi moi code.

## 1. Skill `$phase-docs`

Dung khi can tao hoac sua tai lieu cho mot phase. Skill nay nen tao 2 file rieng:

- Requirement file: mo ta phase can lam gi.
- Design file: mo ta nen implement phase nhu the nao.

Moi phase nam trong mot thu muc rieng duoi `plans/`.

Vi du prompt:

```text
Use $phase-docs tao requirement va design cho Phase 01 dua tren docs/PROJECT_PLAN.md va docs/WEEKLY_PLAN.md.
```

```text
Use $phase-docs cap nhat plans/phase-02-profile/req.md va plans/phase-02-profile/design.md, them API lien quan den profile neu da co trong docs.
```

Ket qua nen nam trong `plans/`, vi du:

```text
plans/phase-01/req.md
plans/phase-01/design.md
plans/phase-02-profile/req.md
plans/phase-02-profile/design.md
```

Noi dung requirement file nen co:

- Muc tieu.
- Pham vi trong phase.
- Khong nam trong phase.
- Yeu cau chuc nang.
- Yeu cau phi chuc nang.
- Tieu chi hoan thanh.
- Rui ro va cau hoi can xac nhan.

Noi dung design file nen co:

- Kien truc/module lien quan.
- Database/schema.
- API contract.
- Socket/realtime neu co.
- UI/UX flow neu co.
- Validation/error handling.
- Security/permission.
- Thu tu implement de xuat.

## 2. Skill `$phase-testcases`

Dung khi can tao testcase cho mot phase dua tren docs va phase docs.

Vi du prompt:

```text
Use $phase-testcases tao testcase cho Phase 01 dua tren plans/phase-01/req.md va plans/phase-01/design.md.
```

```text
Use $phase-testcases bo sung API testcase va edge case cho Phase 03.
```

Ket qua nen nam trong `plans/`, vi du:

```text
plans/phase-01/testcase.md
plans/phase-03-post-feed/testcase.md
```

Testcase nen bao gom:

- Happy path.
- Validation error.
- Permission/auth error.
- Edge case.
- Regression checklist.
- Expected result ro rang.

Setup/infrastructure khong can testcase chi tiet. Voi cac viec nhu tao folder, cai dependency, Dockerfile, docker-compose, Sequelize config, `.env.example`, README, chi can checklist verify ngan neu can. Chi tao testcase chi tiet cho behavior co the test qua API/UI/business flow, vi du register, login, logout, refresh token, verify email, reset password, protected route.

Quy tac dat ID nen on dinh, vi du:

```text
P01-AUTH-001
P02-PROFILE-001
P03-POST-001
```

## 3. Skill `$phase-code`

Dung khi can code mot phase hoac mot feature trong phase.

Vi du prompt:

```text
Use $phase-code implement Phase 01 theo plans/phase-01/req.md, plans/phase-01/design.md va plans/phase-01/testcase.md.
```

```text
Use $phase-code code chuc nang login trong Phase 01, chi lam scope da co trong docs/plans.
```

Truoc khi code, skill nay phai:

- Doc `AI_CODING_RULES.md`.
- Doc `docs/PROJECT_PLAN.md` va `docs/WEEKLY_PLAN.md` neu lien quan.
- Doc phase docs/testcases trong `plans/`.
- Kiem tra code hien tai de follow dung structure.

Sau khi code, AI nen bao cao:

- Da implement phase/feature nao.
- File nao da thay doi.
- Test/check nao da chay.
- Con thieu gi hoac gia dinh nao da dung.

## Workflow mau cho mot phase

### Buoc 1: Tao phase docs

```text
Use $phase-docs tao plans/phase-01/req.md va plans/phase-01/design.md cho Phase 01.
```

### Buoc 2: Tao testcase

```text
Use $phase-testcases tao plans/phase-01/testcase.md dua tren plans/phase-01/req.md va plans/phase-01/design.md.
```

### Buoc 3: Code

```text
Use $phase-code implement Phase 01 theo plans/phase-01/req.md, plans/phase-01/design.md va plans/phase-01/testcase.md.
```

### Buoc 4: Review ket qua

```text
Review phase 01 implementation so voi plans/phase-01/req.md, plans/phase-01/design.md va plans/phase-01/testcase.md.
```

## Quy tac quan trong khi dung skill

- Neu docs chua co thong tin, AI phai noi ro `chua thay trong tai lieu`.
- Neu AI dua them y tuong, phai gan nhan la `de xuat`.
- Neu user yeu cau code vuot scope phase, AI nen canh bao va xin xac nhan.
- Neu testcase chua co, nen tao testcase truoc khi code cac tinh nang lon.
- Setup thuan tuy khong can testcase chi tiet; chi can verification checklist neu can.
- Neu phase qua lon, tach thanh cac feature nho hon trong cung phase.

## Vi du day du

```text
Use $phase-docs tao requirement file va design file cho Phase 02 ve user profile. Hay doc AI_CODING_RULES.md, docs/PROJECT_PLAN.md, docs/WEEKLY_PLAN.md truoc. Chi dung requirement da co trong docs, phan nao la goi y thi ghi ro la De xuat.
```

```text
Use $phase-testcases tao testcase cho Phase 02 dua tren plans/phase-02-profile/req.md va plans/phase-02-profile/design.md. Bao gom manual testcase, API testcase, edge case va regression checklist.
```

```text
Use $phase-code implement Phase 02 user profile theo plans/phase-02-profile/req.md, plans/phase-02-profile/design.md va plans/phase-02-profile/testcase.md. Sau khi code hay chay check lien quan va bao cao file da sua.
```

## Ghi chu

3 skill nay duoc cai trong thu muc Codex local:

```text
C:/Users/Admin/.codex/skills/phase-docs
C:/Users/Admin/.codex/skills/phase-testcases
C:/Users/Admin/.codex/skills/phase-code
```

Neu Codex chua tu nhan skill, hay goi truc tiep bang ten skill trong prompt, vi du `Use $phase-docs ...`.
