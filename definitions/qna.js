/**
 * @swagger
 * definitions:
 *  qna:
 *   type: object
 *   required:
 *     - club_id
 *     - uid
 *     - question
 *   properties:
 *     _id:
 *       type: objectId
 *       description: (기본 생성)
 *     club_id:
 *       type: objectId
 *       description: 동아리
 *     uid:
 *       type: objectId
 *       description: 질문 작성자 _id
 *     question:
 *       type: boolean
 *       description: 질문 내용
 *     isAnswered:
 *       type: boolean
 *       description: 답변 여부
 *     createdAt:
 *       type: string
 *       description: 질문 생성일
 *     answer:
 *       type: object
 *       properties:
 *          _id:
 *              type: ObjectId
 *              description: (기본 생성)
 *          uid:
 *              type: ObjectId
 *              description: 답변 작성자 _id
 *          answer:
 *              type: String
 *              description: 답변 내용
 *          createdAt:
 *           type: String
 *           description: 답변 생성일
 */



